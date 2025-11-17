const FILE_PATH = "./count.txt";

class CountStorage {
  private count: number;

  constructor() {
    this.count = 0;
    void this.initialize();
  }

  private initialize = async () => {
    try {
      const fileContent = await Bun.file(FILE_PATH).text();
      this.count = Number.parseInt(fileContent) || 0;
    } catch (error) {
      console.error("Error initializing count:", error);
      this.count = 0;
      await this.saveCount();
    }
  };

  private saveCount = async () => {
    try {
      await Bun.write(FILE_PATH, this.count.toString());
    } catch (error) {
      console.error("Error saving count:", error);
    }
  };

  getCount = () => {
    return this.count;
  };

  increment = async () => {
    this.count += 1;
    await this.saveCount();
    return this.count;
  };
}

export const countStorage = new CountStorage();
