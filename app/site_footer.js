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
            <div>
                <span>
                    Powered by{" "}
                    <a href="https://gohugo.io" target="_blank" rel="noopener">
                        Hugo
                    </a>{" "}
                    | Theme Inspired By{" "}
                    <a
                        href="https://github.com/michaelneuper/hugo-texify3"
                        target="_blank"
                        rel="noopener"
                    >
                        TeXify3
                    </a>
                </span>
            </div>
            <div>
                <span>
                    Copyright &copy; {new Date().getFullYear()} Sakthipriyan
                    Vairamani (thefourtheye)
                </span>
            </div>
            <div>
                <span>
                    <a href="mailto:sakthi@thefourtheye.in">
                        sakthi at thefourtheye dot in
                    </a>{" "}
                    | <a href="/Resume.pdf">Resume</a>
                </span>
            </div>
        </footer>
    );
}
