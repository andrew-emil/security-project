import { Request, Response } from "express";
import { postSurgeryRepo } from "../../../config/repositories.js";
import { OUTCOME } from "../../../utils/dataTypes.js";

export const getComplications = async (req: Request, res: Response) => {
	const pipeline = [
		{
			$match: {
				complications: { $exists: true, $ne: null, $not: /^\s*$/ },
				createdAt: { $exists: true, $ne: null },
			},
		},
		{
			$addFields: {
				complicationsArray: {
					$filter: {
						input: {
							$map: {
								input: { $split: ["$complications", ","] },
								in: { $trim: { input: "$$this" } },
							},
						},
						as: "comp",
						cond: {
							$and: [
								{ $ne: ["$$comp", ""] },
								{ $ne: [{ $toLower: "$$comp" }, "none"] },
							],
						},
					},
				},
				monthYear: {
					$dateToString: {
						format: "%Y-%m",
						date: "$createdAt",
					},
				},
			},
		},
		{ $unwind: "$complicationsArray" },
		{
			$group: {
				_id: {
					date: "$monthYear",
					complication: { $toLower: "$complicationsArray" },
					dischargeStatus: "$dischargeStatus",
				},
				totalCases: { $sum: 1 },
				successfulCases: {
					$sum: {
						$cond: [{ $eq: ["$outcome", OUTCOME.SUCCESS] }, 1, 0],
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				date: "$_id.date",
				complication: "$_id.complication",
				dischargeStatus: "$_id.dischargeStatus",
				count: "$totalCases",
				successRate: {
					$round: [
						{
							$multiply: [
								{ $divide: ["$successfulCases", "$totalCases"] },
								100,
							],
						},
						2,
					],
				},
			},
		},
		{ $sort: { date: 1 } },
	];

	const timeSeriesData: any[] = await postSurgeryRepo
		.aggregate(pipeline)
		.toArray();

	if(timeSeriesData.length === 0){
		res.status(200).json({
			success: true,
			data: "No data to display"
		});
		return
	}

	const summary = {
		totalComplications: timeSeriesData.reduce(
			(sum, item) => sum + item.count,
			0
		),
		uniqueComplications: [
			...new Set(timeSeriesData.map((item) => item.complication)),
		].length,
	};

	res.status(200).json({
		success: true,
		data: {
			timeSeries: timeSeriesData,
			summary,
		},
	});
};
