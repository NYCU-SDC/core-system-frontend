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
    onChange: (next: boolean) => void;
    className?: string;
};

export default function UnreadSwitch({
                                         checked,
                                         onChange,
                                         className = "",
                                     }: UnreadSwitchProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <Switch id="unread-switch" checked={checked} onCheckedChange={onChange} />
            <Label htmlFor="unread-switch" className="text-sm text-slate-700">
                Unread Only
            </Label>
        </div>
    );
}
