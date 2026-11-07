export default function SiteFooter() {
    return (
        <footer
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                marginTop: "1.65rem",
                paddingTop: "1.1rem",
                borderTop: "1px solid var(--bg2)",
                color: "var(--fg4)",
                fontSize: "0.85rem",
                textAlign: "center",
            }}
        >
            <span>
                Copyright &copy; {new Date().getFullYear()} Sakthipriyan
                Vairamani (thefourtheye)
            </span>
            <span>
                <a href="mailto:sakthi@thefourtheye.in">
                    sakthi at thefourtheye dot in
                </a>{" "}
                | <a href="/Resume.pdf">Resume</a>
            </span>
        </footer>
    );
}
