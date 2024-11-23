import { ICheckIn } from "../types"
import CheckInListItem from "./CheckInListItem"

interface Props {
    checkIns: ICheckIn[],
    onDelete: (n: number) => void,
    onReCheckIn: (s: string) => void
}

const CheckInList = (props: Props) => {
    return <div>
        {props.checkIns.sort((a, b) => b.time > a.time ? 1 : -1).map(c =>
            <CheckInListItem
                key={c.id}
                checkIn={c}
                onDelete={(n) => props.onDelete(n)}
                onReCheckIn={(s) => props.onReCheckIn(s)}
            />
        )}
    </div>
}

export default CheckInList