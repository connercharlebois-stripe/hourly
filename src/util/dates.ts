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
    date.setHours(17);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}