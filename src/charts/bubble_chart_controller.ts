import { AxisController } from "../axis";
import { SvgChart } from "../svg";
import { Controller } from "./controller";

export class BubbleController extends Controller {

    axisController: AxisController;

    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.axisController = new AxisController(svgChart);
    }
    
}
