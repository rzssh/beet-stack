import { countRepository } from "./count.repository";

export class CountService {
  async getCount() {
    await countRepository.boot();
    return { count: countRepository.getCount() };
  }

  async increment() {
    const count = await countRepository.increment();
    return { count };
  }
}

export const countService = new CountService();
