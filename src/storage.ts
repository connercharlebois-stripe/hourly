import { ICheckIn, ISummary, ITotals } from "./types"
import { getEndOfWorkingDay, isOnSameDate } from "./util/dates"

export const getCheckIns = (): ICheckIn[] => {
    const checkIns = window.localStorage.getItem("checkins")
    //@ts-ignore
    return JSON.parse(checkIns) || []
}

export const getDistinctCheckIns = (): ICheckIn[] => {
    const checkInsStr = window.localStorage.getItem("checkins")
    //@ts-ignore
    const checkIns : ICheckIn[] = JSON.parse(checkInsStr);
    const distinctChecks = checkIns.sort((a,b) => new Date(b.time) > new Date(a.time) ? 1 : -1).filter((item, index) => checkIns.findIndex(c => c.label === item.label) === index);
    console.log({distinctChecks})
    return distinctChecks;

}

export const getCheckInsOnDate = (d: Date): ICheckIn[] => {
    const all = getCheckIns();
    return all.filter(c => isOnSameDate(new Date(c.time), d));
}

export const saveCheckIn = (checkIn: ICheckIn): void => {
    let maxId = 0;
    const checkIns = getCheckIns();
    if (checkIns.length > 0) {
        maxId = checkIns.reduce((prev, curr) => curr.id > prev.id ? curr : prev).id;
        console.log({ maxId })
    }
    const newCheckIns = [...checkIns, { ...checkIn, id: maxId + 1 }]
    const sortedCheckIns = newCheckIns.sort((a, b) => a.time < b.time ? -1 : 1);
    // for each checkin, it's duration is the minutes from it's time to the next one in the list, or NOW
    for (let i = 0; i < sortedCheckIns.length; i++) {
        const next = sortedCheckIns[i + 1];
        if (!next) {
            sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, new Date())
        } else {
            sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, next.time)
            sortedCheckIns[i].isActive = false;
        }
    }
    window.localStorage.setItem("checkins", JSON.stringify(sortedCheckIns))
}

export const deleteCheckIn = (id: number) => {
    const all = getCheckIns();
    const i = all.findIndex(c => c.id === id);
    const updatedList = [...all.slice(0,i), ...all.slice(i+1)]
    window.localStorage.setItem("checkins", JSON.stringify(updatedList))

}

export const storeCheckIns = (toSave: ICheckIn[]): void => {
    console.log(`Storing ${toSave.length} checkins`)
    const all = getCheckIns();
    for (const c of toSave) {
        const index = all.findIndex(a => a.id === c.id);
        if (index > -1) {
            all[index].duration = c.duration;
        } else {
            all.push(c);
        }
    }
    console.log(`all.length is ${all.length} checkins`)
    window.localStorage.setItem("checkins", JSON.stringify([...all]))
}

export const getDurations = (d?: Date) => {
    const checkIns = d ? getCheckInsOnDate(d) : getCheckIns();
    const sortedCheckIns = checkIns.sort((a, b) => a.time < b.time ? -1 : 1);
    // for each checkin, it's duration is the minutes from it's time to the next one in the list, or NOW, or EOD
    for (let i = 0; i < sortedCheckIns.length; i++) {
        const eod = getEndOfWorkingDay(d);
        const next = sortedCheckIns[i + 1];
        // if there isn't a next OR if the next is on the next day
        if (!next) {
            if (new Date() > eod){
                sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, eod)
            } else {
                sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, new Date())
            }
        } else {
            if (isOnSameDate(sortedCheckIns[i].time, next.time)){
                sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, next.time)
            } else {
                sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, eod)
            }
            
        }
    }
    console.log(sortedCheckIns);
    storeCheckIns(sortedCheckIns)
    return sortedCheckIns;
}

const diffInMinutes = (date1: Date, date2: Date) => {
    const diffInMilliseconds = new Date(date2).getTime() - new Date(date1).getTime();
    const diffInMinutes = Math.round(diffInMilliseconds / (1000 * 60));
    return Math.abs(diffInMinutes)
}

export const getTotals = (d?: Date) => {
    const checkIns = d ? getCheckInsOnDate(d) : getCheckIns();
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

export { }