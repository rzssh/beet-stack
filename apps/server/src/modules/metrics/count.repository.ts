const FILE_PATH = "./count.txt";

class CountRepository {
  #count = 0;
  #initialized = false;

  constructor() {
    void this.boot();
  }

  async boot() {
    if (this.#initialized) return;
    try {
      const file = await Bun.file(FILE_PATH).text();
      this.#count = Number.parseInt(file, 10) || 0;
    } catch {
      this.#count = 0;
      await this.persist();
    } finally {
      this.#initialized = true;
    }
  }

  private async persist() {
    await Bun.write(FILE_PATH, this.#count.toString());
  }

  getCount() {
    return this.#count;
  }

  async increment() {
    this.#count += 1;
    await this.persist();
    return this.#count;
  }
}

export const countRepository = new CountRepository();
