import { useParams, Link, Navigate } from "react-router-dom";
import { docContent } from "../services/docsData";
import styles from "./DocDetailPage.module.css";

export const DocDetailPage = () => {
	const { category, slug } = useParams();
	const doc = docContent[category]?.[slug];

	if (!doc) {
		return (
			<Navigate
				to="/docs"
				replace
			/>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.breadcrumb}>
				<Link to="/docs">Docs</Link>
				<span className={styles.separator}>/</span>
				<span className={styles.category}>{category}</span>
				<span className={styles.separator}>/</span>
				<span>{slug}</span>
			</div>

			<article className={styles.article}>
				<h1 className={styles.title}>{doc.title}</h1>
				<div className={styles.content}>
					{doc.content.split("\n\n").map((paragraph, index) => {
						// Handle headings (h1, h2, h3) - check these FIRST before any text modification
						if (paragraph.startsWith("### ")) {
							return (
								<h3
									key={index}
									className={styles.heading3}
								>
									{paragraph.replace(/^### /, "")}
								</h3>
							);
						}
						if (paragraph.startsWith("## ")) {
							return (
								<h2
									key={index}
									className={styles.heading2}
								>
									{paragraph.replace(/^## /, "")}
								</h2>
							);
						}
						if (paragraph.startsWith("# ")) {
							return (
								<h1
									key={index}
									className={styles.heading1}
								>
									{paragraph.replace(/^# /, "")}
								</h1>
							);
						}

						// Handle code blocks
						if (paragraph.startsWith("```")) {
							const code = paragraph.replace(/```\w*\n?/g, "");
							return (
								<pre
									key={index}
									className={styles.codeBlock}
								>
									<code>{code}</code>
								</pre>
							);
						}

						// Handle lists
						if (paragraph.includes("\n-") || paragraph.startsWith("-")) {
							const items = paragraph.split("\n").filter(line => line.trim().startsWith("-"));
							if (items.length > 0) {
								return (
									<ul
										key={index}
										className={styles.list}
									>
										{items.map((item, itemIndex) => (
											<li
												key={itemIndex}
												className={styles.listItem}
											>
												{item
													.replace(/^-\s*/, "")
													.split("`")
													.map((part, i) =>
														i % 2 === 0 ? (
															part
														) : (
															<code
																key={i}
																className={styles.inlineCode}
															>
																{part}
															</code>
														)
													)}
											</li>
										))}
									</ul>
								);
							}
						}

						// Handle tables
						if (paragraph.startsWith("|")) {
							const rows = paragraph.split("\n").filter(row => !row.includes("---"));
							return (
								<div
									key={index}
									className={styles.table}
								>
									{rows.map((row, rowIndex) => (
										<div
											key={rowIndex}
											className={rowIndex === 0 ? styles.tableHeader : styles.tableRow}
										>
											{row
												.split("|")
												.filter(cell => cell.trim())
												.map((cell, cellIndex) => (
													<div key={cellIndex}>{cell.trim()}</div>
												))}
										</div>
									))}
								</div>
							);
						}

					// Handle regular paragraphs
					if (paragraph.trim()) {
						// Process inline code and bold text
						const processedParts = [];
						let lastIndex = 0;

						// Create a combined regex to match both code and bold
						const combinedRegex = /(`[^`]+`|\*\*[^*]+\*\*)/g;
						const matches = [...paragraph.matchAll(combinedRegex)];

						matches.forEach((match, idx) => {
								// Add text before this match
								if (match.index > lastIndex) {
									processedParts.push(paragraph.slice(lastIndex, match.index));
								}

								// Handle the match
								if (match[0].startsWith("`")) {
									// Inline code
									processedParts.push(
										<code
											key={`code-${idx}`}
											className={styles.inlineCode}
										>
											{match[0].slice(1, -1)}
										</code>
									);
								} else if (match[0].startsWith("**")) {
									// Bold text
									processedParts.push(<strong key={`bold-${idx}`}>{match[0].slice(2, -2)}</strong>);
								}

								lastIndex = match.index + match[0].length;
							});

							// Add remaining text
							if (lastIndex < paragraph.length) {
								processedParts.push(paragraph.slice(lastIndex));
							}

							return (
								<p
									key={index}
									className={styles.paragraph}
								>
									{processedParts.length > 0 ? processedParts : paragraph}
								</p>
							);
						}
						return null;
					})}
				</div>
			</article>
		</div>
	);
};
