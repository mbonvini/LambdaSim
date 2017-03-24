# Apps

This folder contains sample model and configuration files
used to generate APIs.

In order to create an API with λ-Sim a folder must
contain the following files
- `*.fmu` - the model to simulate
- `config.json` - the configuration file that allows to configure
the API and specify default options for the model

For the `config.json` file please take a look at the `config_template.json`
file located in this folder.

Optional files that are shipped with the API and are used
to render information using the [λ-Sim web GUI](https://mbonvini.github.io/LambdaSim/)
are
- `readme.md` - a markdown file that describes the model and is
meant to provide basic information about the model and its usage,
- `dashboard.json` - a JSON file that specifies the layout of a
dashboard that allows to visualize simulation results and select or
change model parameters.