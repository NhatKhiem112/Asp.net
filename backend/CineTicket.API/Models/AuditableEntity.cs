using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CineTicket.API.Models
{
    /// <summary>
    /// Lớp cơ sở cung cấp các thuộc tính theo dõi thời gian tạo và cập nhật
    /// </summary>
    public abstract class AuditableEntity : IAuditableEntity
    {
        /// <summary>
        /// Thời gian tạo đối tượng. Được lưu trữ ở định dạng UTC nhưng giá trị là thời gian Việt Nam (UTC+7).
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Thời gian cập nhật đối tượng. Được lưu trữ ở định dạng UTC nhưng giá trị là thời gian Việt Nam (UTC+7).
        /// </summary>
        public DateTime? UpdatedAt { get; set; }

        public int? CreatedById { get; set; }

        public virtual User? CreatedBy { get; set; }

        public int? UpdatedById { get; set; }

        public virtual User? UpdatedBy { get; set; }
    }
}