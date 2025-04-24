import { Request, Response } from "express";
import { postSurgeryRepo } from "../../../config/repositories.js";
import { OUTCOME } from "../../../utils/dataTypes.js";

export const getSuccessRates = async (req: Request, res: Response) => {
	const pipeline = [
		{
			$match: {
				createdAt: { $exists: true, $ne: null },
			},
		},
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" },
				},
				totalSurgeries: { $sum: 1 },
				successfulSurgeries: {
					$sum: {
						$cond: [{ $eq: ["$outcome", OUTCOME.SUCCESS] }, 1, 0],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				date: {
					$dateToString: {
						format: "%Y-%m",
						date: {
							$dateFromParts: {
								year: "$_id.year",
								month: "$_id.month",
								day: 1,
							},
						},
					},
				},
				totalSurgeries: 1,
				successfulSurgeries: 1,
				successRate: {
					$multiply: [
						{ $divide: ["$successfulSurgeries", "$totalSurgeries"] },
						100,
					],
				},
			},
		},
		{ $sort: { date: 1 } },
	];

	const aggregatedData: any[] = await postSurgeryRepo
		.aggregate(pipeline)
		.toArray();

	if(aggregatedData.length === 0){
		res.status(200).json({
			success: true,
			data: "No data to display",
		});
		return;
	}

	const formattedData = aggregatedData.map((item) => ({
		date: item.date,
		successRate: Number(item.successRate.toFixed(2)),
		totalSurgeries: item.totalSurgeries,
		successfulSurgeries: item.successfulSurgeries,
		failedSurgeries: item.failedSurgeries,
	}));

	res.status(200).json({
		success: true,
		data: formattedData,
	});
};
