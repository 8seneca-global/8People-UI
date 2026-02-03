declare module "d3-org-chart" {
  export class OrgChart {
    constructor();
    container(selector: string | HTMLElement): this;
    data(data: any[]): this;
    nodeWidth(width: (d: any) => number): this;
    nodeHeight(height: (d: any) => number): this;
    childrenMargin(margin: (d: any) => number): this;
    compactMarginBetween(margin: (d: any) => number): this;
    compactMarginPair(margin: (d: any) => number): this;
    nodeContent(content: (d: any) => string): this;
    onNodeClick(callback: (d: any) => void): this;
    render(): this;
    getChartState(): any;
    expandAll(): this;
    collapseAll(): this;
    fit(): this;
    // Add more methods as needed
  }
}
