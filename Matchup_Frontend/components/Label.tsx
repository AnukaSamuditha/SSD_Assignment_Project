import type { LabelType } from "@/types"

export default function Label({title,name,styles}:LabelType){
    return(
        <label htmlFor={name} style={styles} className={`text-sm font-medium text-black`}>
            {title}
        </label>
    )
}