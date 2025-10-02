import type {UnitResponse} from "@/types/unit.ts";
import {getUnit} from "@/lib/request/getUnit.ts";
import { useQuery } from "@tanstack/react-query";
import { useParams} from 'react-router-dom';

export default function useGetUnit(id: string) {
    const { slug } = useParams();
    return useQuery<UnitResponse>({
        queryKey: ["Unit",id],
        queryFn: ()  => getUnit(slug, id),
        enabled: !!slug,
        placeholderData: {} as UnitResponse
    });
}


