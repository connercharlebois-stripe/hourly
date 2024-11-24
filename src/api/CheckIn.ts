import { ICheckIn } from "../types"
import { diffInMinutes, getEndOfWorkingDay, isOnSameDate } from "../util/dates"

const LS_KEY_CHECKINS = "checkins"

const getAll = (): ICheckIn[] => {
    const checkIns = window.localStorage.getItem(LS_KEY_CHECKINS)
    //@ts-ignore
    return JSON.parse(checkIns) || []
}
const getDistinct = (): ICheckIn[] => {
    const checkInsStr = window.localStorage.getItem(LS_KEY_CHECKINS)
    //@ts-ignore
    const checkIns: ICheckIn[] = JSON.parse(checkInsStr);
    const distinctChecks = checkIns.sort((a, b) => new Date(b.time) > new Date(a.time) ? 1 : -1).filter((item, index) => checkIns.findIndex(c => c.label === item.label) === index);
    console.log({ distinctChecks })
    return distinctChecks;
};
const getOnDate = (d: Date): ICheckIn[] => {
    const all = getAll();
    return all.filter(c => isOnSameDate(new Date(c.time), d));
};
const getById = (id: number): ICheckIn | undefined => {
    return getAll().find(c => c.id === id);
}
const getNext = (c: ICheckIn): ICheckIn | undefined => {
    const all = getAll().sort((a, b) => a.time < b.time ? -1 : 1);;
    const i = all.findIndex(ci => ci.id === c.id);
    return all[i + 1] ?? undefined;
}
const del = (id: number): void => {
    const all = getAll();
    const i = all.findIndex(c => c.id === id);
    const updatedList = [...all.slice(0, i), ...all.slice(i + 1)]
    window.localStorage.setItem(LS_KEY_CHECKINS, JSON.stringify(updatedList))
}
const create = (checkIn: ICheckIn): void => {
    let maxId = 0;
    const checkIns = getAll();
    if (checkIns.length > 0) {
        maxId = checkIns.reduce((prev, curr) => curr.id > prev.id ? curr : prev).id;
        console.log({ maxId })
    }
    const newCheckIns = [...checkIns, { ...checkIn, id: maxId + 1 }]
    window.localStorage.setItem(LS_KEY_CHECKINS, JSON.stringify(newCheckIns))
}
const updateMany = (toSave: ICheckIn[]): void => {
    console.log(`Storing ${toSave.length} checkins`)
    for (const c of toSave) {
        updateOne(c);
    }
}
const updateOne = (toSave: ICheckIn): void => {
    const all = getAll();
    const toUpdate = all.find(c => c.id === toSave.id);
    if (toUpdate) {
        toUpdate.duration = toSave.duration
        window.localStorage.setItem(LS_KEY_CHECKINS, JSON.stringify([...all]))
    } else {
        create(toSave)
    }
}
const calculateDuration = (c: ICheckIn) => {
    const eod = getEndOfWorkingDay(new Date(c.time));
    const next = getNext(c);
    // for each checkin, it's duration is the minutes from it's time to the next one in the list, or NOW, or EOD
    // if there isn't a next OR if the next is on the next day
    if (!next) {
        if (new Date() > eod) {
            c.duration = diffInMinutes(c.time, eod)
        } else {
            c.duration = diffInMinutes(c.time, new Date())
        }
    } else {
        if (isOnSameDate(c.time, next.time)) {
            c.duration = diffInMinutes(c.time, next.time)
        } else {
            c.duration = diffInMinutes(c.time, eod)
        }

    }
}

export default {
    /**
     * Create
     */
    create: create,
    /**
     * Read
     */
    get: {
        all: getAll,
        distinct: getDistinct,
        onDate: getOnDate,
        byId: getById,
        next: getNext
    },
    /**
     * Update
     */
    update: {
        one: updateOne,
        many: updateMany
    },
    /**
     * Delete
     */
    del: del,
    util: {
        calculateDuration
    }
}