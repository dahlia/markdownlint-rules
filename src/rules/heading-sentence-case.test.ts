import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { LintError, LintResults } from "markdownlint";
import { lint as lintSync } from "markdownlint/sync";
import headingSentenceCase from "./heading-sentence-case.ts";

function lint(
  content: string,
  config?: Record<string, unknown>,
): LintResults {
  return lintSync({
    strings: { test: content },
    customRules: [headingSentenceCase],
    config: {
      default: false,
      "heading-sentence-case": config ?? true,
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

describe("HM005: heading-sentence-case", () => {
  describe("valid cases", () => {
    it("should pass for sentence case headings", () => {
      const content = `# Development commands

## Getting started

### Installation steps
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for headings with allowed proper nouns", () => {
      const content = `# API reference for JavaScript

## Working with TypeScript

### Using React and Vue
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for headings with acronyms", () => {
      const content = `# HTTP API reference

## REST and GraphQL

### Working with JSON and XML
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for Setext-style headings", () => {
      const content = `Development commands
====================

Getting started
---------------
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should pass for single word headings", () => {
      const content = `# Overview

## Installation

### Configuration
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });

  describe("invalid cases", () => {
    it("should report error for title case headings", () => {
      const content = `# Development Commands
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(
        errors[0].errorDetail ?? "",
        /Capitalized word\(s\) may violate sentence case: Commands/,
      );
    });

    it("should report error for multiple violations", () => {
      const content = `# Development Commands And Settings
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Commands/);
      assert.match(errors[0].errorDetail ?? "", /And/);
      assert.match(errors[0].errorDetail ?? "", /Settings/);
    });

    it("should report error for Setext headings", () => {
      const content = `Development Commands
--------------------
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
    });

    it("should report multiple errors for multiple headings", () => {
      const content = `# First Heading

## Second Heading

### Third Heading
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 3);
    });
  });

  describe("configuration", () => {
    it("should respect custom allowed_words", () => {
      const content = `# Working with FooBar
`;
      // Without FooBar in allowed words, this would fail
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 1);

      // With FooBar allowed, this should pass
      const errorsCustom = getErrors(content, { allowed_words: ["FooBar"] });
      assert.equal(errorsCustom.length, 0);
    });

    it("should respect ignore_acronyms setting", () => {
      const content = `# Working with CUSTOM
`;
      // With ignore_acronyms: true (default), acronyms are ignored
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 0);

      // With ignore_acronyms: false, acronyms are flagged
      const errorsCustom = getErrors(content, { ignore_acronyms: false });
      assert.equal(errorsCustom.length, 1);
    });
  });

  describe("edge cases", () => {
    it("should ignore inline code in headings", () => {
      const content = `# Using the \`FooBar\` method
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle links in headings", () => {
      const content = `# Working with [Example](https://example.com/)
`;
      const errors = getErrors(content);
      // "Example" is not a proper noun but it's reasonable in a link
      assert.equal(errors.length, 1);
    });

    it("should ignore headings in code blocks", () => {
      const content = `~~~~
# This Is Not A Real Heading
~~~~

# Real heading
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle empty headings", () => {
      const content = `# 

## 
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle headings with only punctuation", () => {
      const content = `# ...

## ---
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should handle GitHub-style headings", () => {
      const content = `# Getting started with GitHub Actions

## Using npm scripts
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });
  });
});
