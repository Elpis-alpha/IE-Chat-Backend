"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLastWeek = exports.getLastDays3Steps = exports.getLastDays = exports.getLastMonth = exports.getDayLetterNumbers = exports.getDayLetters = exports.getMonthLetters = exports.generateDayRange = exports.generateDayRange3Steps = exports.generateWeekRange = exports.generateMonthRange = void 0;
const date_fns_1 = require("date-fns");
const zeroDateTime = (date, to) => {
    if (to === "start")
        date.setHours(0, 0, 0, 0);
    else if (to === "end")
        date.setHours(23, 59, 59, 999);
    return date;
};
const generateMonthRange = (date) => {
    const start = zeroDateTime(new Date(date), "start");
    const end = zeroDateTime(new Date(date), "end");
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);
    return { start, end };
};
exports.generateMonthRange = generateMonthRange;
const generateWeekRange = (date) => {
    const start = (0, date_fns_1.subDays)(zeroDateTime(new Date(date), "start"), 6);
    const end = zeroDateTime(new Date(date), "end");
    return { start, end };
};
exports.generateWeekRange = generateWeekRange;
const generateDayRange3Steps = (date) => {
    const start = (0, date_fns_1.subDays)(zeroDateTime(new Date(date), "start"), 2);
    const end = zeroDateTime(new Date(date), "end");
    return { start, end };
};
exports.generateDayRange3Steps = generateDayRange3Steps;
const generateDayRange = (date) => {
    const start = zeroDateTime(new Date(date), "start");
    const end = zeroDateTime(new Date(date), "end");
    return { start, end };
};
exports.generateDayRange = generateDayRange;
const getMonthLetters = (date) => {
    return (0, date_fns_1.format)(date, 'MMM');
};
exports.getMonthLetters = getMonthLetters;
const getDayLetters = (date) => {
    return (0, date_fns_1.format)(date, 'EEE');
};
exports.getDayLetters = getDayLetters;
const getDayLetterNumbers = (date) => {
    return (0, date_fns_1.format)(date, 'dd');
};
exports.getDayLetterNumbers = getDayLetterNumbers;
const getLastMonth = (date, by = 0) => {
    const newDate = (0, date_fns_1.subMonths)(date, by);
    return newDate;
};
exports.getLastMonth = getLastMonth;
const getLastDays = (date, by = 0) => {
    const newDate = (0, date_fns_1.subDays)(date, by);
    return newDate;
};
exports.getLastDays = getLastDays;
const getLastDays3Steps = (date, by = 0) => {
    const newDate = (0, date_fns_1.subDays)(date, by * 3);
    return newDate;
};
exports.getLastDays3Steps = getLastDays3Steps;
const getLastWeek = (date, by = 0) => {
    const newDate = (0, date_fns_1.subDays)(date, by * 7);
    return newDate;
};
exports.getLastWeek = getLastWeek;
