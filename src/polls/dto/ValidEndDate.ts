import {ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments} from 'class-validator';
import * as dayjs from 'dayjs';

@ValidatorConstraint({ name: 'validEndDate', async: false })
export class ValidEndDate implements ValidatorConstraintInterface {

    validate(date: string, args: ValidationArguments) {
        return dayjs(date).isBefore(dayjs().add(1, 'month')) && dayjs(date).isAfter(dayjs());
    }

    defaultMessage(args: ValidationArguments) {
        const message = dayjs(args.value).isBefore(dayjs())
            ? 'End date must be in the future'
            : 'Poll duration cannot be longer then a month';
        return message;
    }

}