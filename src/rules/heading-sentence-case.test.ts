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
      const content = `# Working with Foobar
`;
      // Without Foobar in allowed words, this would fail
      // (Note: "Foobar" is not PascalCase since it has no internal uppercase)
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 1);

      // With Foobar allowed, this should pass
      const errorsCustom = getErrors(content, { allowed_words: ["Foobar"] });
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

    it("should allow capitalization after colon", () => {
      const content = `# Blah blah: Blah blah

## Configuration: Getting started

### Step one: Configure the settings
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should allow capitalization inside quotation marks", () => {
      const content = `# Did you say "Hello?"

## The "Quick Start" guide

### Using the "Run" command
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should allow capitalization inside single quotation marks", () => {
      const content = `# The 'Hello World' example

## Understanding the 'Start' button
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should allow capitalization inside curly quotation marks", () => {
      const content = `# Did you say \u201cHello?\u201d

## The \u201cQuick Start\u201d guide
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should still detect violations outside quotes and before colons", () => {
      const content = `# Some Bad heading: good part

## A Title Case "quoted" heading
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 2);
      assert.match(errors[0].errorDetail ?? "", /Bad/);
      assert.match(errors[1].errorDetail ?? "", /Title/);
      assert.match(errors[1].errorDetail ?? "", /Case/);
    });

    it("should allow capitalization after leading numbers", () => {
      const content = `# 1. Getting started

## 2. Configuration options

### 10. Advanced settings
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should still detect violations after leading numbers", () => {
      const content = `# 1. Getting Started
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Started/);
    });

    it("should allow PascalCase words (type/class names) by default", () => {
      const content = `# Creating sink from LogOutput

## Working with StringBuilder

### Using MyClass in production
`;
      const errors = getErrors(content);
      assert.equal(errors.length, 0);
    });

    it("should respect ignore_pascal_case setting", () => {
      const content = `# Creating sink from LogOutput
`;
      // With ignore_pascal_case: true (default), PascalCase is ignored
      const errorsDefault = getErrors(content);
      assert.equal(errorsDefault.length, 0);

      // With ignore_pascal_case: false, PascalCase is flagged
      const errorsCustom = getErrors(content, { ignore_pascal_case: false });
      assert.equal(errorsCustom.length, 1);
      assert.match(errorsCustom[0].errorDetail ?? "", /LogOutput/);
    });

    it("should not treat single capital words as PascalCase", () => {
      const content = `# Working with Commands
`;
      // "Commands" is not PascalCase (no internal uppercase after lowercase)
      const errors = getErrors(content);
      assert.equal(errors.length, 1);
      assert.match(errors[0].errorDetail ?? "", /Commands/);
    });
  });
});
