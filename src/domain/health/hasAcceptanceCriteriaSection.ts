const ACCEPTANCE_CRITERIA_TITLE = String.raw`(?:acceptance[ \t]+criteria|критерии[ \t]+при[её]мки|критерии[ \t]+готовности)`;

const MARKDOWN_HEADING_PATTERN = new RegExp(
    String.raw`^[ \t]*#{1,6}[ \t]+${ACCEPTANCE_CRITERIA_TITLE}[ \t]*:?[ \t]*$`,
    'iu',
);
const PLAIN_HEADING_PATTERN = new RegExp(
    String.raw`^[ \t]*${ACCEPTANCE_CRITERIA_TITLE}[ \t]*:[ \t]*$`,
    'iu',
);

export function hasAcceptanceCriteriaSection(description: string): boolean {
    return description
        .split(/\r\n?|\n/u)
        .some((line) => MARKDOWN_HEADING_PATTERN.test(line) || PLAIN_HEADING_PATTERN.test(line));
}
