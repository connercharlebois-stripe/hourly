import { Settings } from "../api/Settings";

export const isOnSameDate = (c: Date, d: Date): boolean => {
    if (!c || !d) {
        return false
    }
    return new Date(c).toDateString() === new Date(d).toDateString();
}

export const getBeginOfToday = () : Date => {
    const beginOfDay = new Date();
    beginOfDay.setHours(0);
    beginOfDay.setMinutes(0);
    beginOfDay.setSeconds(0);
    beginOfDay.setMilliseconds(0);
    return beginOfDay;
}

export const getEndOfWorkingDay = (d?: Date) : Date => {
    const date = d ? new Date(d) : new Date();
    const settings = Settings.get();
    if (settings){
        date.setHours(settings.workingDayEnd.hh);
        date.setMinutes(settings.workingDayEnd.mm);
    } else {
        date.setHours(0);
        date.setMinutes(0);
    }
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

export const diffInMinutes = (date1: Date, date2: Date) => {
    const diffInMilliseconds = new Date(date2).getTime() - new Date(date1).getTime();
    const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
    return Math.abs(diffInMinutes)
}