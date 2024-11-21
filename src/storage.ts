import { ICheckIn, ISummary, ITotals } from "./types"

export const getCheckIns = (): ICheckIn[] => {
    const checkIns = window.localStorage.getItem("checkins")
    //@ts-ignore
    return JSON.parse(checkIns) || []
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

export const storeCheckIns = (all: ICheckIn[]): void => {
    window.localStorage.setItem("checkins", JSON.stringify([...all]))
}

export const getDurations = () => {
    const checkIns = getCheckIns();
    const sortedCheckIns = checkIns.sort((a, b) => a.time < b.time ? -1 : 1);
    // for each checkin, it's duration is the minutes from it's time to the next one in the list, or NOW
    for (let i = 0; i < sortedCheckIns.length; i++) {
        const next = sortedCheckIns[i + 1];
        if (!next) {
            sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, new Date())
        } else {
            sortedCheckIns[i].duration = diffInMinutes(sortedCheckIns[i].time, next.time)
        }
    }
    console.log(sortedCheckIns);
    storeCheckIns(sortedCheckIns)
    return sortedCheckIns;
}

const diffInMinutes = (date1: Date, date2: Date) => {
    const diffInMilliseconds = new Date(date2).getTime() - new Date(date1).getTime();
    const diffInMinutes = Math.round(diffInMilliseconds * 100 / (1000 * 60));
    return Math.abs(diffInMinutes)
}

export const getTotals = () => {
    const checkIns = getCheckIns();
    const totals : ISummary[] = [];
    checkIns.forEach(c => {
        if (c.duration){
            const match = totals.find(t => t.label === c.label);
            if (match) {
                match.duration += c.duration;
                match.checkInCount += 1;
            } else {
                totals.push({
                    label: c.label,
                    duration: c.duration,
                    checkInCount: 1
                })
            }
        }
    })
    return totals;
}

export { }