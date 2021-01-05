require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');
(async() => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    async function login(username, password) {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(process.env.WHEN2WORK);
        const user = await page.$("#username");
        const pass = await page.$("#password");
        await user.type(username);
        await pass.type(password);
        const button = await page.$(".btn-primary");
        button.click();
        console.log("Logged in");
        await page.waitForSelector("#emptopnav", { visible: true });
        var counter = 0;
        await page.evaluate(() =>
            ReplWin('empschedule', '&MyView=Month')
        );
        var cal = await page.waitForSelector(".modwide", { visible: true });
        var html = await cal.evaluate(() => document.querySelector("*").outerHTML);
        var hasText = html.includes(process.env.JOB);
        while (hasText) {
            await page.waitForSelector(".modwide");
            var calendar = await page.$(".modwide");
            await calendar.screenshot({ path: `Calendar${counter}.png` });
            console.log("Screenshot taken ");
            counter += 1;
            await page.evaluate(() => {
                ReplaceWindow('empschedule', '&Month=Next');
            });
            await page.waitForSelector(".modwide");
            html = await page.evaluate(() => document.querySelector("*").outerHTML);
            hasText = html.includes(process.env.JOB);
            if (hasText == false) {
                break;
            }
        }
        await page.evaluate(() => ReplWin('empschedule', '&MyView=Future'));
        await page.waitForSelector(".modwide");
        const border = await page.$(".modwide");
        const borderText = await page.evaluate(el => el.innerText, border);

        var monthDayRegex = /\w\w\w\s([0-9]|[0-9][0-9])[,]/g
        var startRegex = /([0-9]|[0-9][0-9])[:][0-9][0-9][a][m]/g
        var endRegex = /([0-9]|[0-9][0-9])[:][0-9][0-9][p][m]/g
        var yearRegex = /[0-9][0-9][0-9][0-9]/g

        var monthDay = borderText.match(monthDayRegex);
        var start = borderText.match(startRegex);
        var end = borderText.match(endRegex);
        var year = borderText.match(yearRegex);
        await browser.close();
        createICS(monthDay, start, end, year);

    }
    async function createICS(monthDay, start, end, year) {
        var startICS = startCal();
        fs.writeFileSync("Schedule.ics", startICS, { flag: 'w' });
        for (var index = 0; index < monthDay.length; index++) {
            var startHour = start[index].toString().padStart(7, '0');
            var endHour = end[index].toString().padStart(7, '0');
            var day = monthDay[index].match(/([0-9][0-9]|[0-9])/g).toString().padStart(2, '0');
            if (endHour.includes("p")) {
                var endHourNumber = parseInt(endHour) + 12;
            } else {
                var endHourNumber = endHour.substring(0, 2);
            }
            if (startHour.includes("p")) {
                var startHourNumber = parseInt(startHour) + 12;
            } else {
                var startHourNumber = startHour.substring(0, 2);
            }
            var startMinutes = startHour.substring(3, 5);
            var endMinutes = endHour.substring(3, 5);
            var startTotal = startHourNumber + startMinutes;
            var endTotal = endHourNumber + endMinutes;
            var month = returnMonthNumber(monthDay[index].substring(0, 3));
            var middleICS = middleCal("VCU", year[index], month, day, startTotal, endTotal);
            fs.writeFileSync("Schedule.ics", "\n" + middleICS, { flag: 'a' });
        }
        var endICS = endCal();
        fs.writeFileSync("Schedule.ics", "\n" + endICS, { flag: 'a' });

    }

    function startCal() {
        var start = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Work Schedule
X-WR-TIMEZONE:America/New_York
BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York
BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE`;
        return start;
    }

    function middleCal(summary, year, month, day, start, end) {
        var middle = `BEGIN:VEVENT
DTSTART;TZID=America/New_York:${year}${month}${day}T${start}00
DTEND;TZID=America/New_York:${year}${month}${day}T${end}00
RRULE:FREQ=DAILY;COUNT=1
DSTAMP:20201108T014109Z
CREATED:20201108T014107Z
LAST-MODIFIED:20201108T014108Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:${summary}
TRANSP:OPAQUE
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:This is an event reminder
TRIGGER:-P0DT4H0M0S
DESCRIPTION:Work Schedule
END:VALARM
END:VEVENT`
        return middle;
    }

    function endCal() {
        return "END:VCALENDAR";
    }

    function returnMonthNumber(month) {
        var months = {
            'Jan': '01',
            'Feb': '02',
            'Mar': '03',
            'Apr': '04',
            'May': '05',
            'Jun': '06',
            'Jul': '07',
            'Aug': '08',
            'Sep': '09',
            'Oct': '10',
            'Nov': '11',
            'Dec': '12'
        }
        if (typeof(months[month]) == "undefined") {
            return "Invalid month";
        } else {
            return months[month];
        }
    }
    login(process.env.USERNAME, process.env.PASSWORD);
})();
