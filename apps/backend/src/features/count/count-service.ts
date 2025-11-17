import { countStorage } from "./storage";

class CountService {
	getCount = () => {
		return {
			count: countStorage.getCount(),
		};
	};

	increment = async () => {
		const newCount = await countStorage.increment();
		return {
			success: true,
			message: "Count incremented successfully",
			count: newCount,
		};
	};
}

export const countService = new CountService();
