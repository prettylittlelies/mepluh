const IMAGE_NAME = "Medal.exe";

const run = async (command: readonly string[]): Promise<string> => {
    const child = Bun.spawn([...command], { stdout: "pipe", stderr: "ignore" });
    const output = await new Response(child.stdout).text();
    await child.exited;
    return output;
};

export const isMedalRunning = async (): Promise<boolean> =>
    (await run(["tasklist", "/FI", `IMAGENAME eq ${IMAGE_NAME}`, "/NH"])).toLowerCase().includes(IMAGE_NAME.toLowerCase());

export const stopMedal = async (): Promise<boolean> => {
    if (!(await isMedalRunning())) return false;
    await run(["taskkill", "/IM", IMAGE_NAME, "/F", "/T"]);
    return true;
};
