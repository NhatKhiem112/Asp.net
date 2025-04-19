using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineTicket.API.Data;
using CineTicket.API.Models;
using CineTicket.API.DTOs;

namespace CineTicket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CinemasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CinemasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Cinemas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CinemaListDTO>>> GetCinemas()
        {
            var cinemas = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                .ToListAsync();

            return CinemaListDTO.FromCinemaList(cinemas);
        }

        // GET: api/Cinemas/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CinemaDetailDTO>> GetCinema(int id)
        {
            var cinema = await _context.Cinemas
                .Include(c => c.CinemaHalls)
                    .ThenInclude(ch => ch.Seats)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (cinema == null)
            {
                return NotFound();
            }

            // Chuyển đổi từ Cinema model sang DTO để không trả về đầy đủ danh sách phòng
            var cinemaDetail = CinemaDetailDTO.FromCinema(cinema);

            return cinemaDetail;
        }

        // POST: api/Cinemas
        [HttpPost]
        public async Task<ActionResult<Cinema>> CreateCinema(Cinema cinema)
        {
            _context.Cinemas.Add(cinema);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCinema), new { id = cinema.Id }, cinema);
        }

        // PUT: api/Cinemas/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCinema(int id, Cinema cinema)
        {
            if (id != cinema.Id)
            {
                return BadRequest();
            }

            _context.Entry(cinema).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CinemaExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Cinemas/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCinema(int id)
        {
            var cinema = await _context.Cinemas.FindAsync(id);
            if (cinema == null)
            {
                return NotFound();
            }

            _context.Cinemas.Remove(cinema);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CinemaExists(int id)
        {
            return _context.Cinemas.Any(e => e.Id == id);
        }
    }
}