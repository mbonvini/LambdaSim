import log from 'loglevel';
import React from 'react';
import DashboardTextField from '../components/dashboard-text-field';
import DashboardSelectField from '../components/dashboard-select-field';
import DashboardPlotContainer from '../containers/dashboard-plot-container';

export class Dashboard {

    /**
     * Contructor for the Dashboard class.
     * This method takes a JSON representation of the
     * dashboard and it saves it. This will be used
     * later to build the components that are part of it.
     * @param {*} definition 
     */
    constructor(definition) {
        this.definition = definition;
    }

    static getComponentWidget(widget, row, col, itm){
        const key = "w_"+row+"_"+col+"_"+itm;
        switch(widget.wtype){
            case "html":
                return <div key={key} dangerouslySetInnerHTML={{__html: widget.content.join("")}} />
            case "image":
                return <img key={key} className="responsive-img" src={widget.src} />
            case "text_field":
                return <DashboardTextField key={key} widget={widget}/>;
            case "select_field":
                return <DashboardSelectField key={key} uniqueKey={key+"_select_field"} widget={widget} />;
            case "plot":
                return <DashboardPlotContainer key={key} uniqueKey={key+"_plot"} widget={widget} />; //<div key={key}>PLOT</div>; //
            default:
                return <div key={key}>widget.wtype</div>
        }
    }
}