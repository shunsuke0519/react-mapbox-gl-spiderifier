import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _ from "lodash";
import { isReactComponent } from "../../common/utils";
import { MarkerLayer } from "../MarkerLayer";

class SpiderifierElement extends MarkerLayer {
	constructor(props) {
		super(props);
		this.state = {
			animateClass: ""
		};
	}

	componentWillMount() {
		const { animate } = this.props;
		this.setState({
			animateClass: classnames({ "animate initial": animate })
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
	}

	componentDidMount() {
		super.componentDidMount();
		if (this._animationEnabled()) {
			_.delay(() => this.setState({ animateClass: "animate" }), 0);
		}
	}

	componentDidUpdate() {
		this.attachChildren();
	}

	getStyle(props) {
		const { shouldRenderLeg, x, y, style } = props;

		let marginLeft = "";
		let marginTop = "";
		let transitionDelay = "";
		if (shouldRenderLeg) {
			marginLeft = `${x}px`;
			marginTop = `${y}px`;
			transitionDelay = this._getTransitionDelay(props);
		}

		return {
			...style,
			marginLeft,
			marginTop,
			transitionDelay
		};
	}

	getContainerClassName(props) {
		const { animateClass } = this.state;
		const { className, y } = props;
		return classnames("spidered-marker", className, animateClass, {
			top: y <= 0,
			bottom: y > 0
		});
	}

	getContent(props) {
		const { shouldRenderLeg } = props;
		return (
			<div>
				<div className="icon-div">{this._getDecorateChildren(props)}</div>
				{shouldRenderLeg && <div className="line-div" style={this._getLegStyles(props)} />}
			</div>
		);
	}

	getOffset() {
		const { shouldRenderLeg, x, y } = this.props;
		return shouldRenderLeg ? [x, y] : [0, 0];
	}

	getProperties() {
		if (this.props.children) {
			return this.props.children.props.properties;
		}

		return {};
	}

	setChildRef = childRef => (this.childRef = this.childRef || childRef);

	_animationEnabled(props = this.props) {
		const { animate } = props;
		return animate;
	}

	_getDecorateChildren(props) {
		const { children, coordinates } = props;
		return React.Children.map(children, child => {
			if (isReactComponent(child)) {
				return React.cloneElement(child, {
					coordinates,
					offset: this.getOffset(),
					ref: this.setChildRef,
					mapBox: this.getMapInstance()
				});
			}

			return child;
		});
	}

	_getLegStyles(props) {
		const { legLength, angle, legStyles } = props;

		return {
			...legStyles,
			height: legLength,
			transform: `rotate(${angle - Math.PI / 2}rad)`,
			transitionDelay: this._getTransitionDelay(props)
		};
	}

	_getTransitionDelay(props) {
		const { animate, transitionDelay } = props;

		return animate ? `${transitionDelay}s` : "";
	}
}

SpiderifierElement.displayName = "SpiderifierElement";
SpiderifierElement.propTypes = {
	...MarkerLayer.propTypes,
	angle: PropTypes.number,
	animate: PropTypes.bool,
	legLength: PropTypes.number,
	legStyles: PropTypes.object,
	index: PropTypes.number,
	shouldRenderLeg: PropTypes.bool,
	transitionDelay: PropTypes.number,
	x: PropTypes.number,
	y: PropTypes.number
};

SpiderifierElement.defaultProps = {
	animate: true,
	transitionDelay: 200
};

export default SpiderifierElement;
