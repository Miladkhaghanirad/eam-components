import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import OpenInNewIcon from 'mdi-material-ui/OpenInNew'
import { Link } from 'react-router-dom'

const numberReg = /^\-?(0|([1-9]\d*))(\.\d+)?$/
const typingNumberReg = /^\-?\d*\.?\d*?$/

export default class EAMBaseInput extends Component {

    //PROPS
    // VALIDATORS (list not required) default([])
    // DEFAULT HELPER TEXT (string not required)
    // SHOW HELPER TEXT (function not required)

    linkButtonStyle = {
        position: "absolute",
        top: 20,
        right:  -2,
        backgroundColor: "white",
        width: 32,
        height: 32,
        zIndex: 100,
        padding: 0
    }

    mainDivStyle = {
        position: "relative"
    }

    state = {
        error: false,
        helperText: null,
        disabled: false,
        value: '',
        validators: [], // [{validator: function(){}, errorText: ''}]
        transformers: [] // To transform the value while typing, ex: uppercase
    }

    componentDidMount () {
        this.initBase(this.props)
    }

    componentWillReceiveProps (nextProps) {
        this.initBase(nextProps)
    }

    initBase = props => {
        // Register as children
        let { children, elementInfo, customValidators, valueKey, transformers } = props;
        if (children && elementInfo) {
            children[elementInfo.xpath] = this;
        }
        
        // Set the validators
        const myValidators = [...(customValidators || [])]
        const myTransformers = [...(transformers || [])]

        if (elementInfo) {
            const label = elementInfo.text;
            if (this.isRequired()) {
                myValidators.push(this.hasValue(label))
            }
            if (elementInfo.fieldType === 'number') {
                myValidators.push(this.isNumber(label))
            }
        }
        // Set the transformers        
        if (this.isUpperCase()) {
            myTransformers.push(this.toUpperCase)
        }

        this.setState({validators: myValidators, transformers: myTransformers}, 
            //Subclass init
            () => {
                if (this.init) this.init(props)
            })
    }

    // TODO apply modifiers e.g. uppercasing, number
    setValue = (value, applyTransformers = true) => this.setState({value: applyTransformers ? this.applyTransformers(value): value})

    applyTransformers = (value) => this.state.transformers.reduce((acc, transformer) => transformer(acc), value)

    toUpperCase = value => !value ? value 
        : typeof value === 'object' ? {...value, code: value.code ? value.code.toUpperCase() : value.code}
        : value.toUpperCase ? value.toUpperCase()
        : value

    hasValue = label => ({
        getResult: value => {
            return !!(value !== null && 
                typeof value === 'object' ? value.code || value.length > 0
                : value)
        },
        errorText: `*Required field` 
    })

    isNumber = label => ({
        getResult: value => !value || numberReg.test(value),
        errorText: `*Number expected` 
    })

    // getValues({code: , codeDesc})

    enable = () => this.setState({disabled: false})

    disable = () => this.setState({disabled: true})

    isRequired = () => this.props.elementInfo && (this.props.elementInfo.attribute === 'R' || this.props.elementInfo.attribute === 'S')

    isHidden = () => this.props.elementInfo && this.props.elementInfo.attribute === 'H'

    isUpperCase = () => this.props.elementInfo && this.props.elementInfo.characterCase === 'uppercase'

    validate () {
        let { validators, value } = this.state;
        let helperText = '';
        let valid = !validators
            .some(({ getResult, errorText }) => {
                let failed = getResult && !getResult(value)
                if (failed) helperText = errorText
                return failed
            })
        this.setState({error: !valid, helperText: helperText})
        return valid
    }

    onChangeHandler = (value, valueFound = {}, executeExtra = true) => {
        // TODO: uppercased fields
        //if (this.props.elementInfo.characterCase === 'uppercase') {
        //    value = value.toUpperCase()
        //}

        // Don't set the value if it is about to (or has already) exceeded the max length
        if (value &&
            value.length &&
            this.props.elementInfo &&
            this.props.elementInfo.maxLength &&
            value.length > this.props.elementInfo.maxLength) {
            return
        }

        if (this.props.updateProperty) {
            this.props.updateProperty(this.props.valueKey, value);
        }

        //Extra function if needed
        if (executeExtra && this.props.onChangeValue) {
            this.props.onChangeValue(value, valueFound);
        }
    };

    render () {
        if (this.isHidden() || !this.renderComponent) {
            return null
        }

        let eamLink = null;

        if (this.props.link && this.props.link(this.state.value)) {
            if (this.props.link().startsWith("http")) {
                eamLink = props => <a href={this.props.link(this.state.value)} {...props} target="_blank"/>
            } else {
                eamLink = props => <Link to={this.props.link(this.state.value)} {...props} />
            }
        }

        return (
            <div style={this.mainDivStyle}>
                {this.renderComponent()}
                {this.props.link && this.props.link(this.state.value) &&
                    <IconButton style={this.linkButtonStyle} component={eamLink}>
                        <OpenInNewIcon/>
                    </IconButton>
                }
            </div>
        )
    }
}

EAMBaseInput.defaultProps = {
    customValidators: []
}