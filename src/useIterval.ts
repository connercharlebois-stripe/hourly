import { useEffect, useRef } from "react";

export function useInterval(callback : Function, delay : number) {
    const savedCallback = useRef<Function>();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    useEffect(() => {
      function tick() {
        //@ts-ignore
        savedCallback.current();
      }
  
      if (delay !== null) {
        let intervalId = setInterval(tick, delay);
        return () => clearInterval(intervalId);
      }
    }, [delay]);
  }