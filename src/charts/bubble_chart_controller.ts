import { XYHorVertAxisController } from "../x_y_hor_vert_axis";
import { SvgChart } from "../svg";
import { Controller } from "./controller";

export class BubbleController extends Controller {

    axisController: XYHorVertAxisController;

    /**
     * @param svgChart - SvgChart instance.
     */
    constructor(svgChart: SvgChart) {
        super(svgChart);
        this.axisController = new XYHorVertAxisController(svgChart);
    }
    
}
