<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Fitur Clock In (Absen Masuk)
     */
    public function clockIn(Request $request)
    {
        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'latitude'  => 'required',
            'longitude' => 'required',
        ]);

        $attendance = Attendance::create([
            'user_id'   => $request->user_id,
            'date'      => Carbon::now()->toDateString(),
            'clock_in'  => Carbon::now()->toTimeString(),
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
            'status'    => 'present'
        ]);

        return response()->json(['success' => true, 'data' => $attendance], 201);
    }

    /**
     * Fitur Clock Out (Absen Keluar)
     */
    public function clockOut(Request $request, $id)
    {
        $attendance = Attendance::where('user_id', $id)
                                ->where('date', Carbon::now()->toDateString())
                                ->first();

        if (!$attendance) return response()->json(['message' => 'Belum absen masuk hari ini'], 404);

        $attendance->update([
            'clock_out' => Carbon::now()->toTimeString()
        ]);

        return response()->json(['success' => true, 'message' => 'Berhasil Clock Out', 'data' => $attendance]);
    }
}