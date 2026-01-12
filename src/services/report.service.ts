import type {ReportFilterDto, ResponseMonthlySummaryDto} from "../models/report.model.ts";
import api from "./api.ts";

export const reportService = {
    getMontlySummary: async (filters: ReportFilterDto): Promise<ResponseMonthlySummaryDto> => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') { params.append(key, value.toString()); }
        });

        const response = await api.get<ResponseMonthlySummaryDto>(`/report/monthly-summary?${params.toString()}`);
        return response.data
    }
}