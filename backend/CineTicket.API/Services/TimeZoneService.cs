using System;

namespace CineTicket.API.Services
{
    public class TimeZoneService
    {
        private readonly TimeZoneInfo _vietnamTimeZone;
        private readonly TimeSpan _vietnamOffset = new TimeSpan(7, 0, 0);

        public TimeZoneService()
        {
            // Sử dụng múi giờ UTC+7 cho Việt Nam
            _vietnamTimeZone = TimeZoneInfo.CreateCustomTimeZone(
                "Vietnam Standard Time",
                new TimeSpan(7, 0, 0),
                "Vietnam Standard Time",
                "Vietnam Standard Time");
        }

        // Chuyển đổi từ UTC sang múi giờ Việt Nam
        public DateTime ConvertToVietnamTime(DateTime utcDateTime)
        {
            if (utcDateTime.Kind == DateTimeKind.Utc)
            {
                return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, _vietnamTimeZone);
            }
            else
            {
                // Nếu không phải UTC, giả định là UTC và chuyển đổi
                return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc), _vietnamTimeZone);
            }
        }

        // Chuyển đổi từ múi giờ Việt Nam sang UTC
        public DateTime ConvertToUtc(DateTime vietnamDateTime)
        {
            if (vietnamDateTime.Kind == DateTimeKind.Unspecified)
            {
                // Nếu không có Kind, đặt Kind là Local trước khi chuyển đổi
                var localDateTime = DateTime.SpecifyKind(vietnamDateTime, DateTimeKind.Local);
                // Chuyển đổi từ giờ Việt Nam sang UTC
                return localDateTime.AddHours(-7).ToUniversalTime();
            }
            else if (vietnamDateTime.Kind == DateTimeKind.Local)
            {
                // Chuyển đổi từ giờ địa phương sang UTC
                return vietnamDateTime.ToUniversalTime();
            }
            else if (vietnamDateTime.Kind == DateTimeKind.Utc)
            {
                // Nếu đã là UTC thì trả về nguyên bản
                return vietnamDateTime;
            }

            // Fallback - chuyển đổi dựa trên offset Việt Nam
            return DateTime.SpecifyKind(vietnamDateTime.AddHours(-7), DateTimeKind.Utc);
        }

        // Lấy thời gian hiện tại theo múi giờ Việt Nam, không phải dạng UTC
        public DateTime GetCurrentVietnamTime()
        {
            // Lấy thời gian hiện tại (UTC) và thêm 7 giờ, đánh dấu là thời gian địa phương
            var vietnamTime = DateTime.UtcNow.Add(_vietnamOffset);
            return DateTime.SpecifyKind(vietnamTime, DateTimeKind.Local);
        }

        /// <summary>
        /// Lấy thời gian hiện tại theo múi giờ Việt Nam (UTC+7) nhưng đánh dấu là UTC.
        /// Điều này giúp hệ thống lưu trữ thời gian dưới dạng UTC+7 trong cơ sở dữ liệu nhưng không
        /// bị chuyển đổi sang múi giờ khác khi hiển thị.
        /// </summary>
        /// <returns>Thời gian hiện tại ở Việt Nam định dạng UTC</returns>
        public DateTime GetCurrentVietnamTimeAsUtc()
        {
            // Lấy thời gian hiện tại (UTC) và thêm 7 giờ, đánh dấu là UTC để tránh chuyển đổi tiếp
            var vietnamTime = DateTime.UtcNow.Add(_vietnamOffset);
            return DateTime.SpecifyKind(vietnamTime, DateTimeKind.Utc);
        }
    }
}