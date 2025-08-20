import fs from "fs";
import path from "path";

export default async function Home() {
    const appDir = path.join(process.cwd(), "app");
    const entries = fs.readdirSync(appDir, { withFileTypes: true });
    const apps = [];

    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== "api") {
            const metaPath = path.join(appDir, entry.name, "meta.json");
            if (fs.existsSync(metaPath)) {
                const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                apps.push({
                    dir: entry.name,
                    name: meta.name,
                    summary: meta.summary,
                });
            }
        }
    }

    return (
        <main style={{ maxWidth: 600, margin: "auto" }}>
            <h1>My Single Page Apps</h1>
            <hr />
            <ul>
                {apps.map((app) => (
                    <li key={app.name} style={{ marginBottom: 24 }}>
                        <h3>
                            <a href={`/${app.dir}.html`}>{app.name}</a>
                        </h3>
                        <p>{app.summary}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
