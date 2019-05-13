import DateFnsUtils from '@date-io/date-fns';
import Icon from '@material-ui/core/Icon';
import { format } from 'date-fns';
import parse from "date-fns/parse";
import { DatePicker, DateTimePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';
import PropTypes from 'prop-types';
import React from 'react';
import EAMBaseInput from './EAMBaseInput';
import EAMTextField from './EAMTextField';

export default class EAMDatePicker extends EAMBaseInput {

    init = props => {
        this.setValue(props.value || '', false)
        this.setState({
            dateFormatValue: props.dateFormatValue,
            dateFormatDisplay: props.dateFormatDisplay
        })
    }

    readValue = value => 
        !value ? null
        : typeof value === "string" ? parse(value.substring(0, this.state.dateFormatValue.length), this.state.dateFormatValue, new Date())
        : typeof value === "number" ? new Date(value)
        : value 

    readDate = date => date ?
        format(date, this.state.dateFormatValue)
        : ''

    getPickerProps = (state, props) => {
        const { elementInfo } = props;
        const { helperText, error, disabled, value, dateFormatDisplay } = state;

        return {
            InputAdornmentProps: {style: {marginRight: -12}},
            keyboard: true,
            error,
            helperText: helperText,
            disabled: disabled || (elementInfo && elementInfo.readonly),
            required: this.isRequired(),
            clearable: true,
            value: this.readValue(value),
            onChange: date => this.onChangeHandler(this.readDate(date)),
            format: dateFormatDisplay,
            label: elementInfo && elementInfo.text,
            leftArrowIcon: <Icon> keyboard_arrow_left </Icon>,
            rightArrowIcon: <Icon> keyboard_arrow_right </Icon>,
            TextFieldComponent: EAMTextField
        }
    }

    renderComponent () {
        const { showTime } = this.props;

        return (
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                {showTime ? 
                    <DateTimePicker
                        {...this.getPickerProps(this.state, this.props)}
                        ampm={false}
                    />
                    : <DatePicker
                        {...this.getPickerProps(this.state, this.props)}
                    />
                }
            </MuiPickersUtilsProvider>
        )
    }
}

EAMDatePicker.propTypes = {
    dateFormatDisplay: PropTypes.string.isRequired,
    dateFormatValue: PropTypes.string.isRequired,
    showTime: PropTypes.bool.isRequired
};

EAMDatePicker.defaultProps = {
    showTime: false
};