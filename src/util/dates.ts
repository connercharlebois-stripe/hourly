export const isOnSameDate = (c: Date, d: Date): boolean => {
    if (!c || !d) {
        return false
    }
    return c.toDateString() === d.toDateString();
}

export const getBeginOfToday = () : Date => {
    const beginOfDay = new Date();
    beginOfDay.setHours(0);
    beginOfDay.setMinutes(0);
    beginOfDay.setSeconds(0);
    beginOfDay.setMilliseconds(0);
    return beginOfDay;
}
