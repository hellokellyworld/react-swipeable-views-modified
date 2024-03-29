import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { mod } from "../core/index.js"

export default function virtualize(MyComponent) {
  class Virtualize extends PureComponent {
    timer = null;

    constructor(props) {
      super(props);
      this.state.index = props.index || 0;
    }

    /**
     *
     *           index          indexStop
     *             |              |
     * indexStart  |       indexContainer
     *   |         |         |    |
     * ------------|-------------------------->
     *  -2    -1   0    1    2    3    4    5
     */
    state = {
    
    };

    // componentWillMount() {
    //   this.setWindow(this.state.index);
    // }
    componentDidMount() {
			this.setWindow(this.state.index);
			const { index } = this.props;
		}

    // componentWillReceiveProps(nextProps) {
    //   const { index } = nextProps;

    //   if (typeof index === 'number' && index !== this.props.index) {
    //     const indexDiff = index - this.props.index;
    //     this.setIndex(index, this.state.indexContainer + indexDiff, indexDiff);
    //   }
    // }

    incrementIndexFromParent() {
      //this is called by parent component App.js
      console.log("increment by 1")
      const indexDiff = 1;
      this.setIndex(this.state.index, this.state.indexContainer + indexDiff, indexDiff);
  
    }

    decrementIndexFromParent() {
      //this is called by parent component App.js
      console.log("decrement by 1")
      const indexDiff = -1;
      this.setIndex(this.state.index, this.state.indexContainer + indexDiff, indexDiff);
  
    }

    static getDerivedStateFromProps(nextProps, prevState) {
			const { index } = nextProps;

			if (typeof index === "number" && index != prevState.index) {
				const indexDiff = index - prevState.index;
				//const newState = setNewIndex(index, this.state.indexContainer + indexDiff, indexDiff);
				//setIndex(index, this.state.indexContainer + indexDiff, indexDiff);
				//return newState;
				return index;
			} else {
				return null;
			}
		}

		componentDidUpdate(prevProps, prevState) {
  const index =prevProps.index;
			if (typeof index === "number" && index !== this.props.index) {
				const indexDiff = index - this.props.index;
				this.setIndex(index, this.state.indexContainer + indexDiff, indexDiff);
			}
		}

    componentWillUnmount() {
      clearInterval(this.timer);
    }

    setIndex(index, indexContainer, indexDiff) {
      const nextState = {
        index,
        indexContainer,
        indexStart: this.state.indexStart,
        indexStop: this.state.indexStop,
      };

      // We are going forward, let's render one more slide ahead.
      if (
        indexDiff > 0 &&
        (!this.props.slideCount || nextState.indexStop < this.props.slideCount - 1)
      ) {
        nextState.indexStop += 1;
      }

      // Extend the bounds if needed.
      if (index > nextState.indexStop) {
        nextState.indexStop = index;
      }

      const beforeAhead = nextState.indexStart - index;

      // Extend the bounds if needed.
      if (beforeAhead > 0) {
        nextState.indexContainer += beforeAhead;
        nextState.indexStart -= beforeAhead;
      }
      this.setState(nextState);

    }

    setWindow(index = this.state.index) {
      const { slideCount } = this.props;

      let beforeAhead = this.props.overscanSlideBefore;
      let afterAhead = this.props.overscanSlideAfter;

      if (slideCount) {
        if (beforeAhead > index) {
          beforeAhead = index;
        }

        if (afterAhead + index > slideCount - 1) {
          afterAhead = slideCount - index - 1;
        }
      }

      this.setState({
        indexContainer: beforeAhead,
        indexStart: index - beforeAhead,
        indexStop: index + afterAhead,
      });
    }

    handleChangeIndex = (indexContainer, indexLatest) => {
      const { slideCount, onChangeIndex } = this.props;

      const indexDiff = indexContainer - indexLatest;
      let index = this.state.index + indexDiff;

      if (slideCount) {
        index = mod(index, slideCount);
      }

      // Is uncontrolled
      if (this.props.index === undefined) {
        this.setIndex(index, indexContainer, indexDiff);
      }

      if (onChangeIndex) {
        onChangeIndex(index, this.state.index);
      }
    };

    handleTransitionEnd = () => {
      // Delay the update of the window to fix an issue with react-motion.
      this.timer = setTimeout(() => {
        this.setWindow();
      }, 0);

      if (this.props.onTransitionEnd) {
        this.props.onTransitionEnd();
      }
    };

    render() {
      const {
        children,
        index: indexProp,
        onChangeIndex,
        onTransitionEnd,
        overscanSlideAfter,
        overscanSlideBefore,
        slideCount,
        slideRenderer,
        ...other
      } = this.props;

      const { indexContainer, indexStart, indexStop } = this.state;

      const slides = [];

      for (let slideIndex = indexStart; slideIndex <= indexStop; slideIndex += 1) {
        slides.push(
          slideRenderer({
            index: slideIndex,
            key: slideIndex,
          }),
        );
      }

      return (
        <MyComponent
          index={indexContainer}
          onChangeIndex={this.handleChangeIndex}
          onTransitionEnd={this.handleTransitionEnd}
          {...other}
        >
          {slides}
        </MyComponent>
      );
    }
  }

  Virtualize.propTypes = {
    /**
     * @ignore
     */
    children: (props, propName) => {
      if (props[propName] !== undefined) {
        return new Error("The children property isn't supported.");
      }

      return null;
    },
    /**
     * @ignore
     */
    index: PropTypes.number,
    /**
     * @ignore
     */
    onChangeIndex: PropTypes.func,
    /**
     * @ignore
     */
    onTransitionEnd: PropTypes.func,
    /**
     * Number of slide to render after the visible slide.
     */
    overscanSlideAfter: PropTypes.number,
    /**
     * Number of slide to render before the visible slide.
     */
    overscanSlideBefore: PropTypes.number,
    /**
     * When set, it's adding a limit to the number of slide: [0, slideCount].
     */
    slideCount: PropTypes.number,
    /**
     * Responsible for rendering a slide given an index.
     * ({ index: number }): node.
     */
    slideRenderer: PropTypes.func.isRequired,
  };

  Virtualize.defaultProps = {
    overscanSlideAfter: 2,
    // Render one more slide for going backward as it's more difficult to
    // keep the window up to date.
    overscanSlideBefore: 3,
  };

  return Virtualize;
}
