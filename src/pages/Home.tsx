import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Home() {
    return (
        <div className="flex flex-col gap-4 h-full w-full p-6">
            <span className="font-semibold text-2xl">Me</span>
            <div className="flex justify-center border border-dashed rounded-lg h-full w-full p-6">
                <Card className="min-w-150 p-0">
                    <CardHeader className="bg-slate-100 p-6">
                        <CardTitle className="font-semibold text-lg">
                            Username
                        </CardTitle>
                        <CardDescription>Admin</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm flex flex-col gap-3 grow">
                        <p className="font-semibold">Payload</p>
                        <div className="flex justify-between">
                            <span className="text-slate-500">name</span>
                            <span>name</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">email</span>
                            <span>example@example.com</span>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 bg-slate-100"></CardFooter>
                </Card>
            </div>
        </div>
    );
}
