const WeekKeyEnumArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
Object.freeze(WeekKeyEnumArray);

const MonthKeyEnumArray = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
Object.freeze(MonthKeyEnumArray);


export function dateFormatHelper(newDateObj, is12Format = true) {
    if (newDateObj === null || !(newDateObj instanceof Date)) {
        throw new Error("must passin a date time object")
    }

    let temphour = newDateObj.getHours();
    let subfix = "";
    if (is12Format) {
        if (temphour >= 12) {
            temphour = temphour - 12;
            subfix = " PM";
        } else {
            subfix = " AM";
        }

        if (temphour === 0) {
            temphour = 12;
        }
    }

    const hour = temphour > 9 ? temphour : "0" + temphour;
    const minute = newDateObj.getMinutes() > 9 ? newDateObj.getMinutes() : "0" + newDateObj.getMinutes();
    const second = newDateObj.getSeconds() > 9 ? newDateObj.getSeconds() : "0" + newDateObj.getSeconds();
    const weekend = WeekKeyEnumArray[newDateObj.getDay()];

    let timeColor = "#000000";
    if (newDateObj.getHours() >= 7 && newDateObj.getHours() < 19) {
        /** day time */
        timeColor = "#ad712b";
    } else {
        /** night time */
        timeColor = "#004187";
    }

    let dayColor = "#000000";
    if (newDateObj.getDay() > 0 && newDateObj.getDay() < 6) {
        /** work day */
        dayColor = "#000000";
    } else {
        /** weekend */
        dayColor = "#660000";
    }

    const year = newDateObj.getFullYear();
    const month = MonthKeyEnumArray[newDateObj.getMonth()];
    const date = newDateObj.getDate() > 9 ? newDateObj.getDate() : "0" + newDateObj.getDate();

    return {
        hour: hour,
        minute: minute,
        second: second,
        weekend: weekend,

        year: year,
        month: month,
        date: date,

        subfix: subfix,
        timeColor: timeColor,
        dayColor: dayColor
    }
};

export function datetimeFormatter(value, is12Format = true) {
    const temp = dateFormatHelper(value, is12Format);
    return temp.year + "-" + temp.month + "-" + temp.date + " " + temp.hour + ":" + temp.minute + ":" + temp.second + temp.subfix;
};