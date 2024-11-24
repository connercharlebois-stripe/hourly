import CheckIn from "./api/CheckIn";
import { ISummary } from "./types";

export const getDurations = (d?: Date) => {
    const checkIns = d ? CheckIn.get.onDate(d) : CheckIn.get.all();
    // const sortedCheckIns = checkIns.sort((a, b) => a.time < b.time ? -1 : 1);
    // for each checkin, it's duration is the minutes from it's time to the next one in the list, or NOW, or EOD
    for (let i = 0; i < checkIns.length; i++) {
        CheckIn.util.calculateDuration(checkIns[i])
    }
    console.log(checkIns);
    CheckIn.update.many(checkIns)
    return checkIns;
}

export const getTotals = (d?: Date) => {
    const checkIns = d ? CheckIn.get.onDate(d) : CheckIn.get.all();
    const totals: ISummary[] = [];
    checkIns.forEach(c => {
        if (c.duration) {
            const match = totals.find(t => t.label === c.label);
            if (match) {
                match.duration += c.duration;
                match.checkInCount += 1;
            } else {
                totals.push({
                    label: c.label,
                    duration: c.duration,
                    checkInCount: 1,
                    date: c.time
                })
            }
        }
    })
    return totals;
}

export { };
