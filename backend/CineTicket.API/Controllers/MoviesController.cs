using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CineTicket.API.Data;
using CineTicket.API.Models;

namespace CineTicket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MoviesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MoviesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Movies
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
        {
            return await _context.Movies.ToListAsync();
        }

        // GET: api/Movies/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
            {
                return NotFound();
            }

            return movie;
        }

        // GET: api/Movies/now-showing
        [HttpGet("now-showing")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetNowShowingMovies()
        {
            var currentDate = DateTime.Now;
            return await _context.Movies
                .Where(m => m.ReleaseDate <= currentDate && m.EndDate >= currentDate)
                .ToListAsync();
        }

        // GET: api/Movies/coming-soon
        [HttpGet("coming-soon")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetComingSoonMovies()
        {
            var currentDate = DateTime.Now;
            return await _context.Movies
                .Where(m => m.ReleaseDate > currentDate)
                .ToListAsync();
        }

        // GET: api/Movies/popular
        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<Movie>>> GetPopularMovies()
        {
            return await _context.Movies
                .OrderByDescending(m => m.Rating)
                .Take(10)
                .ToListAsync();
        }
    }
}