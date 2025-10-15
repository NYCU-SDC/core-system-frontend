//
//
// import { Switch } from "@/components/ui/switch"
//
// const UnreadSwitch = () => {
//     return (
//         <div className="flex flex-row gap-2">
//             <Switch id="read-state"/>
//             <p className="font-medium text-slate-800 text-sm">Unread</p>
//         </div>
//     )
// }
// export default UnreadSwitch
//
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type UnreadSwitchProps = {
    checked: boolean;
    className?: string;
    onCheckedChange?: (next: boolean) => void; // for compatibility with some switch implementations
};

export default function UnreadSwitch({
                                         checked,
                                         onCheckedChange,
                                         className = "",
                                     }: UnreadSwitchProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Switch id="unread-switch" checked={checked} onCheckedChange={onCheckedChange} />
            <Label htmlFor="unread-switch" className="text-sm text-slate-700">
                Unread
            </Label>
        </div>
    );
}
