# action-pylint: Python Code Linting GitHub Action

The **action-pylint** GitHub Action package provides a comprehensive solution for linting Python code repositories. It
comes pre-configured with a selection of popular Python linting tools and automatically generates a linting report
during GitHub Action execution.

## Supported Linting Tools

- [black](https://black.readthedocs.io/en/stable/): An uncompromising Python code formatter.
- [flake8](https://flake8.pycqa.org/en/latest/): A versatile code checker for Python.
- [mypy](https://mypy.readthedocs.io/en/stable/): A static type checker for Python.
- [pycodestyle](https://pycodestyle.pycqa.org/en/latest/): A tool to check Python code against a style guide.
- [pyflakes](https://github.com/PyCQA/pyflakes): A lightweight Python lint checker.
- [pylint](https://pylint.readthedocs.io/en/stable/): A source code, bug, and quality checker for Python.

## Basic Usage

To use **action-pylint** in your workflow, include the following steps in your workflow YAML file:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
```

This configuration will set up your workflow to check out the repository, set up Python environment, and execute the
action-pylint package for linting your Python code.

For more advanced usage and customization options, please refer below.

## Advanced Usage

For more advanced usage scenarios, refer to the following sections. This action provides several inputs for
customization:

### Supported Linting Tools

You can specify which linting tool to use with the `tool` input. The default tool used is `flake8`. Here are examples of
how to specify different tools:

#### black

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'black'
```

#### flake8

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'flake8'
```

#### mypy

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'mypy'
```

#### pycodestyle

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'pycodestyle'
```

#### pyflakes

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'pyflakes'
```

#### pylint

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'pylint'
```

### Path Specification

You can specify the directory or file to perform the linting on using the `path` input. The default path is `.` (current
directory). Examples:

```yaml
# Linting all Python files in the current directory
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      path: '.'
```

```yaml
# Linting a specific Python file
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      path: 'test.py'
```

### Additional Configuration

You can further customize the behavior of the action with the following inputs:

#### Artifact Name

Specify the name for the linting report artifact using the `artifact-name` input. The default name is `lint-report`.
Example:

```yaml
# Customize artifact name for flake8 report
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      artifact-name: 'flake8-report'
```

#### Verbose Mode

Enable or disable verbose mode with the `verbose` input. This controls the amount of output generated during linting.
Default is `true`. Example:

```yaml
# Disable verbose mode for less output
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      verbose: 'false'
```

#### Colorization

Control terminal colorization with the `color` input. This feature enhances readability of the linting output. Default
is `true`. Example:

```yaml
# Disable colorization for plain text output in the terminal
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      color: 'false'
```

#### Statistics

Enable or disable statistics in the linting report with the `statistics` input. This provides insights into the code
quality based on the selected tool. Default is `true`. Example:

```yaml
# Disable statistics in the linting report for brevity
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      statistics: 'false'
```

#### Additional Arguments

You can pass additional arguments to the linting tool using the `arguments` input. This allows for further customization
of the linting process.

```yaml
# Additional arguments for flake8
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-python@v5
  - uses: coldsofttech/action-pylint@v1
    with:
      tool: 'flake8'
      arguments: '--select E123,W456 --enable-extensions H111'
```

## Linting Configuration

For configurations related to linting, please consult the documentation of the respective linting tool. You can create
the required configuration file within the repository, and this linting action will automatically pick up the
configuration accordingly.

### Examples

#### black Configuration (pyproject.toml)

- Create a `pyproject.toml` file in the root of your repository.
- Add the configuration options like:

```toml
[tool.black]
line-length = 88
target-version = ['py37']
include = '\.pyi?$'
```

- For more details, refer to
  the [black Configuration Documentation](https://black.readthedocs.io/en/stable/usage_and_configuration/the_basics.html).

#### flake8 Configuration (.flake8)

- Create a `.flake8` file in the root of your repository.
- Add the configuration options like:

```ini
[flake8]
extend-ignore = E203
exclude = .git,__pycache__,docs/source/conf.py,old,build,dist
max-complexity = 10
```

- For more details, refer to
  the [flake8 Configuration Documentation](https://flake8.pycqa.org/en/latest/user/configuration.html).

#### mypy Configuration (mypy.ini)

- Create a `mypy.ini` file in the root of your directory.
- Add the configuration options like:

```ini
[mypy]
warn_return_any = True
warn_unused_configs = True

[mypy-mycode.foo.*]
disallow_untyped_defs = True

[mypy-mycode.bar]
warn_return_any = False

[mypy-somelibrary]
ignore_missing_imports = True
```

- For more details, refer to
  the [mypy Configuration Documentation](https://mypy.readthedocs.io/en/stable/config_file.html).

#### pycodestyle Configuration (.pycodestyle)

- Create a `.pycodestyle` file in the root of your directory.
- Add the configuration options like:

```ini
[pycodestyle]
count = False
ignore = E226,E302,E71
max-line-length = 160
statistics = True
```

- For more details, refer to
  the [pycodestyle Configuration Documentation](https://pycodestyle.pycqa.org/en/latest/intro.html#configuration).

#### pylint Configuration (pyproject.toml)

- Create a `pyproject.toml` file in the root of your directory.
- Add the configuration options like:

```toml
[tool.pylint.main]
analyse-fallback-blocks = false
clear-cache-post-run = false
confidence = ["HIGH", "CONTROL_FLOW", "INFERENCE", "INFERENCE_FAILURE", "UNDEFINED"]
disable = ["bad-inline-option", "consider-using-augmented-assign", "deprecated-pragma", "file-ignored", "locally-disabled", "prefer-typing-namedtuple", "raw-checker-failed", "suppressed-message", "use-implicit-booleaness-not-comparison-to-string", "use-implicit-booleaness-not-comparison-to-zero", "use-symbolic-message-instead", "useless-suppression"]
enable = []
evaluation = "max(0, 0 if fatal else 10.0 - ((float(5 * error + warning + refactor + convention) / statement) * 10))"
exit-zero = false
```

- For more details, refer to
  the [pylint Configuration Documentation](https://pylint.pycqa.org/en/latest/user_guide/configuration/all-options.html).

# License

Please refer to the [MIT License](LICENSE) within the project for more detailed information about licensing.
Additionally, consult the [ADDITIONAL LICENSES](ADDITIONAL%20LICENSES.md) file for licensing details pertaining to
components used within this package.

# Contributing

We welcome contributing from the community! Whether you have ideas for new features, bug fixes, or enhancements, feel
free to open an issue or submit a pull request on [GitHub](https://github.com/coldsofttech/action-pylint).