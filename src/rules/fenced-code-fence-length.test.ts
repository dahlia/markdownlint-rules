import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LintError, LintResults } from "markdownlint";
import { lint as lintSync } from "markdownlint/sync";
import fencedCodeFenceLength from "./fenced-code-fence-length.ts";

function lint(
  content: string,
  config?: Record<string, unknown>,
): LintResults {
  return lintSync({
    strings: { test: content },
    customRules: [fencedCodeFenceLength],
    config: {
      default: false,
      "fenced-code-fence-length": config ?? true,
    },
  });
}

function getErrors(
  content: string,
  config?: Record<string, unknown>,
): LintError[] {
  const results = lint(content, config);
  return results.test ?? [];
}

describe("HM002: fenced-code-fence-length", () => {
  describe("valid cases", () => {
    it("should pass for code blocks with 4 tildes", () => {
      const content = `~~~~ typescript
const x = 1;
~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for code blocks with 4 tildes and no language", () => {
      const content = `~~~~
const x = 1;
~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for indented code blocks with 4 tildes", () => {
      const content = `  ~~~~ typescript
  const x = 1;
  ~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for code blocks with 5 or more tildes (matching)", () => {
      const content = `~~~~~ typescript
const x = 1;
~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for code blocks with 6 tildes (matching)", () => {
      const content = `~~~~~~ typescript
const x = 1;
~~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for nested code blocks with different lengths", () => {
      // Outer fence uses 5 tildes, inner uses 4
      const content = `~~~~~ markdown
Here is a code block:

~~~~ typescript
const x = 1;
~~~~
~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("invalid fence characters", () => {
    it("should report error for backticks", () => {
      const content = `\`\`\`\` typescript
const x = 1;
\`\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected tildes, found backticks/,
      );
    });

    it("should report error for 3 backticks", () => {
      const content = `\`\`\` typescript
const x = 1;
\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected at least 4 tildes, found 3 backticks/,
      );
    });

    it("should report error for 4 backticks", () => {
      const content = `\`\`\`\` typescript
const x = 1;
\`\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected tildes, found backticks/,
      );
    });
  });

  describe("invalid fence length", () => {
    it("should report error for 3 tildes", () => {
      const content = `~~~ typescript
const x = 1;
~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected at least 4 tildes, found 3/,
      );
    });

    it("should report error for mismatched fence lengths", () => {
      const content = `~~~~ typescript
const x = 1;
~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Closing fence length \(5\) does not match opening fence length \(4\)/,
      );
    });

    it("should not close code block if closing fence is shorter", () => {
      // When closing fence is shorter than opening, it's not recognized
      // as a closing fence (per CommonMark spec), so code block stays open
      const content = `~~~~~~ typescript
const x = 1;
~~~~
`;
      const errors = getErrors(content);
      // Only opening fence is checked; the shorter "~~~~" is inside the block
      assert.equal(errors.length, 0);
    });
  });

  describe("configuration", () => {
    it("should respect custom min_fence_length", () => {
      const content = `~~~ typescript
const x = 1;
~~~
`;
      // With default (4), this would be invalid
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 2);

      // With min_fence_length: 3, this should be valid
      const errorsCustom = getErrors(content, { min_fence_length: 3 });
      assert.equal(errorsCustom.length, 0);
    });

    it("should allow longer fences with custom min_fence_length", () => {
      const content = `~~~~~ typescript
const x = 1;
~~~~~
`;
      // With min_fence_length: 5, 5 tildes should be valid
      const errors = getErrors(content, { min_fence_length: 5 });
      assert.equal(errors.length, 0);
    });

    it("should reject shorter fences with custom min_fence_length", () => {
      const content = `~~~~ typescript
const x = 1;
~~~~
`;
      // With min_fence_length: 5, 4 tildes should be invalid
      const errors = getErrors(content, { min_fence_length: 5 });
      assert.equal(errors.length, 2);
      assert.match(
        errors[0].errorDetail ?? "",
        /Expected at least 5 tildes, found 4/,
      );
    });
  });

  describe("fix information", () => {
    it("should provide fix info for backticks", () => {
      const content = `\`\`\`\` typescript
const x = 1;
\`\`\`\`
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "~~~~ typescript");
      assert.equal(errors[1].fixInfo?.insertText, "~~~~");
    });

    it("should provide fix info for too short fence", () => {
      const content = `~~~ typescript
const x = 1;
~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.ok(errors[0].fixInfo);
      assert.equal(errors[0].fixInfo?.insertText, "~~~~ typescript");
      assert.equal(errors[1].fixInfo?.insertText, "~~~~");
    });

    it("should provide fix info for mismatched fence lengths", () => {
      const content = `~~~~ typescript
const x = 1;
~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.ok(errors[0].fixInfo);
      // Fix should make closing fence match opening (4 tildes)
      assert.equal(errors[0].fixInfo?.insertText, "~~~~");
    });

    it("should preserve indentation in fix", () => {
      const content = `  ~~~ typescript
  const x = 1;
  ~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.equal(errors[0].fixInfo?.insertText, "  ~~~~ typescript");
      assert.equal(errors[1].fixInfo?.insertText, "  ~~~~");
    });
  });

  describe("nested code blocks", () => {
    it("should handle documentation about code blocks", () => {
      // When documenting Markdown code blocks, you use 5 tildes to wrap 4
      const content = `~~~~~ markdown
Here is a code block:

~~~~ typescript
const x = 1;
~~~~
~~~~~
`;
      // Both outer (5 tildes) and inner (4 tildes) are valid now
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle deeply nested code blocks", () => {
      const content = `~~~~~~ markdown
Outer documentation:

~~~~~ markdown
Inner documentation:

~~~~ typescript
const x = 1;
~~~~
~~~~~
~~~~~~
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });
});
