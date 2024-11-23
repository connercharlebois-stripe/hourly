import { IUserSettings } from "../types";

const LS_KEY_SETTINGS = "settings"
const get = () : IUserSettings | undefined => {
   const lsString = window.localStorage.getItem(LS_KEY_SETTINGS);
   if (lsString) {
    return JSON.parse(lsString)
   } else {
    return undefined
   }
}

const set = (s: IUserSettings) : void => {
    window.localStorage.setItem(LS_KEY_SETTINGS, JSON.stringify(s));
}

export const Settings = {
    get,
    set
}