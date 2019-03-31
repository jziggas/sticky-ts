export interface IStickyOptions {
    marginBottom?: number;
    marginTop?: number;
    stickyClass?: string | null;
    stickyContainer?: string;
    stickyFor?: number;
    wrap?: boolean;
}
export interface IStickyElementConfig extends IStickyOptions {
    active: boolean;
    container?: any;
    rect: any;
    resizeEvent?: boolean;
    resizeListener?: EventListener;
    scrollEvent?: boolean;
    scrollListener?: EventListener;
}
export interface IStickyElement extends HTMLElement {
    sticky: IStickyElementConfig;
}
export interface IViewportData {
    height: number;
    width: number;
}
export interface IRectangle {
    left: number;
    height: number;
    top: number;
    width: number;
}
export declare class Sticky {
    body: HTMLBodyElement;
    elements: any[];
    firstRender: boolean;
    options: IStickyOptions;
    scrollTop: number;
    selector: string;
    vp: IViewportData;
    /**
     * @constructor
     * @param selector - Selector string to find elements.
     * @param options - Options for the sticky elements (can be overwritten by data-{option}="" attributes).
     */
    constructor(selector?: string, options?: IStickyOptions);
    /**
     * Waits for page to be fully loaded, then renders & activates every sticky element found with the specified selector.
     * @function
     */
    run(): void;
    /**
     * Assigns the needed variables for sticky elements, that are used in the future for calculations.
     * @function
     * @param element - Element to be rendered
     */
    renderElement(element: IStickyElement): void;
    /**
     * Wraps element with a placeholder element.
     * @function
     * @param element - Element to be wrapped.
     */
    wrapElement(element: IStickyElement): void;
    /**
     * Function that activates element when specified conditions are met and then initalise events
     * @function
     * @param element - Element to be activated
     */
    activate(element: IStickyElement): void;
    /**
     * Adds onResizeEvents to window listener and assigns function to element as resizeListener.
     * @function
     * @param element - Element for which resize events are initialised
     */
    initResizeEvents(element: IStickyElement): void;
    /**
     * Removes element listener from resize event.
     * @function
     * @param element - Element from which listener is deleted.
     */
    destroyResizeEvents(element: IStickyElement): void;
    /**
     * Fired when user resizes window. It checks if element should be activated or deactivated and then runs setPosition function.
     * @function
     * @param element - Element for which event function is fired
     */
    onResizeEvents(element: IStickyElement): void;
    /**
     * Adds onScrollEvents to window listener and assigns function to element as scrollListener.
     * @function
     * @param element - Element for which scroll events are initialised
     */
    initScrollEvents(element: IStickyElement): void;
    /**
     * Removes element listener from scroll event.
     * @function
     * @param element - Element from which listener is deleted.
     */
    destroyScrollEvents(element: IStickyElement): void;
    /**
     * Fired when user scrolls window. Invokes setPosition function if element is active.
     * @function
     * @param element - Element for which event function is fired
     */
    onScrollEvents(element: IStickyElement): void;
    /**
     * Main function for the library. Here are some condition calculations and css appending for sticky element when user scroll window
     * @function
     * @param element - Element that will be positioned if it's active
     */
    setPosition(element: IStickyElement): void;
    /**
     * Updates element sticky rectangle (with sticky container), then activates or deactivates element and updates its position if it's active.
     * @function
     */
    update(): void;
    /**
     * Destroys sticky element, remove listeners
     * @function
     */
    destroy(): void;
    /**
     * Function that returns container element in which sticky element is stuck (if is not specified, then it's stuck to body)
     * @function
     * @param element - Element which sticky container are looked for
     * @return Node - Sticky container
     */
    getStickyContainer(element: IStickyElement): Node;
    /**
     * Returns an element's rectangle & position.
     * @function
     * @param element - Element in which position & rectangle are returned.
     * @return
     */
    getRectangle(element: IStickyElement): IRectangle;
    /**
     * Returns viewport dimensions.
     * @function
     * @return
     */
    getViewportSize(): IViewportData;
    /**
     * Helper function to add/remove css properties for specified element.
     * @param element - DOM element
     * @param properties - CSS properties that will be added/removed from specified element
     */
    css(element: HTMLElement, properties: {
        [key: string]: any;
    }): void;
    /**
     * Returns the window scroll position.
     * @function
     * @return Number - scroll position
     */
    private getScrollTopPosition;
}
