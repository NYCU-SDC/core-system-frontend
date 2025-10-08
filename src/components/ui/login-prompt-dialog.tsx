import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface LoginPromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogin: () => void;
}

export function LoginPromptDialog({ open, onOpenChange, onLogin }: LoginPromptDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>請先登入</DialogTitle>
                    <DialogDescription>
                        您的登入狀態已過期或尚未登入。請重新登入以繼續使用系統。
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/login/oauth/google?r=${window.location.href}`;
                        }}
                    >
                        前往登入
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
