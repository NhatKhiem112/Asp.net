import React, { useState } from 'react';

interface DateRangePickerProps {
    onDateRangeChange: (startDate: string, endDate: string) => void;
    initialStartDate?: string;
    initialEndDate?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    onDateRangeChange,
    initialStartDate = '',
    initialEndDate = ''
}) => {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        onDateRangeChange(newStartDate, endDate);
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        setEndDate(newEndDate);
        onDateRangeChange(startDate, newEndDate);
    };

    return (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="w-full sm:w-1/2">
                <input
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="input input-bordered w-full"
                    placeholder="Start date"
                />
            </div>
            <div className="w-full sm:w-1/2">
                <input
                    type="date"
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="input input-bordered w-full"
                    placeholder="End date"
                />
            </div>
        </div>
    );
};

export default DateRangePicker; 